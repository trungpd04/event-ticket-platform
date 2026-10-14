package com.trungpd.eventticketplatform.ticketing.repository;

import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.SQLException;

@Repository
public class TicketPoolJdbcDao {

    private final JdbcTemplate jdbcTemplate;

    public TicketPoolJdbcDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final String INSERT_AVAILABLE = """
            INSERT INTO tickets (ticket_type_id, event_id, status)
            VALUES (?, ?, 'AVAILABLE')
            """;

    public void insertAvailableBatch(Long ticketTypeId, Long eventId, int count) {
        if (count <= 0) {
            return;
        }
        jdbcTemplate.batchUpdate(INSERT_AVAILABLE, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                ps.setLong(1, ticketTypeId);
                ps.setLong(2, eventId);
            }

            @Override
            public int getBatchSize() {
                return count;
            }
        });
    }

}
