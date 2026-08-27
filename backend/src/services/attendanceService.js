import { pool } from '../config/database.js';
import meetingRepository from '../repositories/meetingRepository.js';

class AttendanceService {
    async getAttendanceReport(meetingId, userId) {
        // 1. Check if meeting exists
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        // 2. ✅ Verify the user is the HOST only
        const [hostCheck] = await pool.execute(
            `SELECT 1 FROM meeting_participants 
             WHERE meeting_id = ? AND user_id = ? AND role = 'host'`,
            [meetingId, userId]
        );

        if (hostCheck.length === 0) {
            throw new Error('Only the host can view attendance');
        }

        // 3. Get all participants with their join/leave times
        const [participants] = await pool.execute(
            `SELECT 
                mp.user_id,
                mp.role,
                mp.status,
                mp.joined_at,
                mp.left_at,
                u.first_name,
                u.last_name,
                u.email,
                TIMESTAMPDIFF(SECOND, mp.joined_at, mp.left_at) as duration_seconds
            FROM meeting_participants mp
            JOIN users u ON mp.user_id = u.id
            WHERE mp.meeting_id = ? AND mp.status != 'removed'
            ORDER BY mp.joined_at ASC`,
            [meetingId]
        );

        // 4. Calculate summary
        const total = participants.length;
        const present = participants.filter(p => p.status === 'joined').length;
        const left = participants.filter(p => p.status === 'left').length;
        const waiting = participants.filter(p => p.status === 'waiting').length;
        const late = participants.filter(p => {
            if (!meeting.start_time) return false;
            const joinTime = new Date(p.joined_at);
            const startTime = new Date(meeting.start_time);
            return joinTime > startTime;
        }).length;

        // 5. Build report with status mapping
        const report = participants.map(p => {
            let status = 'absent';
            let punctuality = 'N/A';

            if (p.status === 'joined') {
                status = 'present';
                if (meeting.start_time) {
                    const joinTime = new Date(p.joined_at);
                    const startTime = new Date(meeting.start_time);
                    const diffMinutes = (joinTime - startTime) / 60000;
                    if (diffMinutes > 5) {
                        punctuality = 'late';
                    } else {
                        punctuality = 'on time';
                    }
                }
            } else if (p.status === 'left') {
                status = 'left early';
            } else if (p.status === 'waiting') {
                status = 'waiting';
            }

            return {
                user_id: p.user_id,
                first_name: p.first_name,
                last_name: p.last_name,
                email: p.email,
                role: p.role,
                join_time: p.joined_at,
                leave_time: p.left_at,
                duration_seconds: p.duration_seconds || 0,
                status: status,
                punctuality: punctuality,
            };
        });

        return {
            meeting: {
                id: meeting.id,
                title: meeting.title,
                code: meeting.code,
                start_time: meeting.start_time,
                end_time: meeting.end_time,
                status: meeting.status,
            },
            summary: {
                total,
                present,
                left,
                waiting,
                late,
                attendance_rate: total > 0 ? Math.round((present / total) * 100) : 0,
            },
            report,
        };
    }
}

export default new AttendanceService();