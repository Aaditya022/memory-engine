package com.mnemo.memoryengine.actionitem;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ActionItemRepository extends JpaRepository<ActionItem, UUID> {
    List<ActionItem> findByOrganizationIdAndStatus(UUID organizationId, ActionItemStatus status);
    List<ActionItem> findByOrganizationId(UUID organizationId);
    List<ActionItem> findByOrganizationIdAndOwnerNameIgnoreCase(UUID organizationId, String ownerName);
}
