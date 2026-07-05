package com.mnemo.memoryengine.decision;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DecisionRepository extends JpaRepository<Decision, UUID> {
    List<Decision> findByOrganizationId(UUID organizationId);
    List<Decision> findByMeetingId(UUID meetingId);
}
