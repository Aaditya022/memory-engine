package com.mnemo.memoryengine.timeline;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class TimelineService {

    private final NamedParameterJdbcTemplate jdbc;

    public TimelineService(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Chronological view of memories, optionally scoped to a project/topic keyword. */
    public List<TimelineEvent> getTimeline(UUID organizationId, String topic) {
        StringBuilder sql = new StringBuilder("""
            SELECT m.id as memory_id, m.meeting_id, mt.title as meeting_title, m.memory_type,
                   m.content, m.owner_name, m.event_date, m.created_at
            FROM memories m
            JOIN meetings mt ON mt.id = m.meeting_id
            WHERE m.organization_id = :orgId
            """);
        MapSqlParameterSource params = new MapSqlParameterSource().addValue("orgId", organizationId);

        if (topic != null && !topic.isBlank()) {
            sql.append(" AND m.search_vector @@ plainto_tsquery('english', :topic)");
            params.addValue("topic", topic);
        }

        sql.append(" ORDER BY coalesce(m.event_date, m.created_at::date) ASC, m.created_at ASC");

        return jdbc.query(sql.toString(), params, (rs, rowNum) -> new TimelineEvent(
                (UUID) rs.getObject("memory_id"),
                (UUID) rs.getObject("meeting_id"),
                rs.getString("meeting_title"),
                rs.getString("memory_type"),
                rs.getString("content"),
                rs.getString("owner_name"),
                rs.getDate("event_date") != null ? rs.getDate("event_date").toLocalDate() : null,
                rs.getTimestamp("created_at").toInstant()
        ));
    }
}
