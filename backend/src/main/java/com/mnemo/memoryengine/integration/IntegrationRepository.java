package com.mnemo.memoryengine.integration;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IntegrationRepository extends JpaRepository<Integration, UUID> {
    List<Integration> findByOrganizationId(UUID organizationId);
    Optional<Integration> findByOrganizationIdAndName(UUID organizationId, String name);
}
