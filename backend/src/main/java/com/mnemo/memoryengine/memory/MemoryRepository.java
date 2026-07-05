package com.mnemo.memoryengine.memory;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MemoryRepository extends JpaRepository<Memory, UUID> {
    List<Memory> findByOrganizationIdAndOwnerNameIgnoreCase(UUID organizationId, String ownerName);
    List<Memory> findByOrganizationIdAndMemoryType(UUID organizationId, MemoryType type);
    List<Memory> findByOrganizationIdOrderByEventDateAsc(UUID organizationId);
    List<Memory> findByMeetingId(UUID meetingId);
}
