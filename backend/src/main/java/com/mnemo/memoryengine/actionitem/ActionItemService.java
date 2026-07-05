package com.mnemo.memoryengine.actionitem;

import com.mnemo.memoryengine.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ActionItemService {

    private final ActionItemRepository actionItemRepository;

    public ActionItemService(ActionItemRepository actionItemRepository) {
        this.actionItemRepository = actionItemRepository;
    }

    public List<ActionItem> list(UUID organizationId, ActionItemStatus status, String ownerName) {
        if (status != null) return actionItemRepository.findByOrganizationIdAndStatus(organizationId, status);
        if (ownerName != null && !ownerName.isBlank())
            return actionItemRepository.findByOrganizationIdAndOwnerNameIgnoreCase(organizationId, ownerName);
        return actionItemRepository.findByOrganizationId(organizationId);
    }

    @Transactional
    public ActionItem updateStatus(UUID id, ActionItemStatus status) {
        ActionItem item = actionItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Action item not found: " + id));
        item.setStatus(status);
        return actionItemRepository.save(item);
    }
}
