package com.mnemo.memoryengine.extraction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EntityRelationshipRepository extends JpaRepository<EntityRelationship, UUID> {
    List<EntityRelationship> findBySourceEntityIgnoreCaseOrTargetEntityIgnoreCase(String source, String target);
    List<EntityRelationship> findByOrganizationId(UUID organizationId);
}
