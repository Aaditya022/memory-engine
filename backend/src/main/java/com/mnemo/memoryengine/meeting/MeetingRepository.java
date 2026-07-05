package com.mnemo.memoryengine.meeting;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MeetingRepository extends JpaRepository<Meeting, UUID> {
    Page<Meeting> findByOrganizationId(UUID organizationId, Pageable pageable);
}
