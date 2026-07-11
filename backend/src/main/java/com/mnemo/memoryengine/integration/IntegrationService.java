package com.mnemo.memoryengine.integration;

import com.mnemo.memoryengine.common.ResourceNotFoundException;
import com.mnemo.memoryengine.integration.dto.IntegrationResponse;
import com.mnemo.memoryengine.integration.dto.UpdateIntegrationRequest;
import com.mnemo.memoryengine.organization.Organization;
import com.mnemo.memoryengine.organization.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class IntegrationService {

    private static final List<String> SUPPORTED_INTEGRATIONS = List.of(
        "SLACK", "GITHUB", "NOTION", "JIRA", "GOOGLE_CALENDAR", "MICROSOFT_TEAMS"
    );

    private final IntegrationRepository integrationRepository;
    private final OrganizationRepository organizationRepository;

    public IntegrationService(IntegrationRepository integrationRepository,
                               OrganizationRepository organizationRepository) {
        this.integrationRepository = integrationRepository;
        this.organizationRepository = organizationRepository;
    }

    @Transactional(readOnly = true)
    public List<IntegrationResponse> list(UUID organizationId) {
        List<Integration> existing = integrationRepository.findByOrganizationId(organizationId);
        var existingNames = existing.stream().map(Integration::getName).collect(Collectors.toSet());

        // Auto-create missing integration rows for display
        for (String name : SUPPORTED_INTEGRATIONS) {
            if (!existingNames.contains(name)) {
                Organization org = organizationRepository.findById(organizationId).orElse(null);
                if (org != null) {
                    Integration integration = new Integration(org, name);
                    existing.add(integrationRepository.save(integration));
                }
            }
        }

        return existing.stream()
            .sorted((a, b) -> Integer.compare(
                SUPPORTED_INTEGRATIONS.indexOf(a.getName()),
                SUPPORTED_INTEGRATIONS.indexOf(b.getName())))
            .map(IntegrationResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional
    public IntegrationResponse update(UUID organizationId, String name, UpdateIntegrationRequest request) {
        Integration integration = integrationRepository
            .findByOrganizationIdAndName(organizationId, name.toUpperCase())
            .orElseThrow(() -> new ResourceNotFoundException("Integration not found: " + name));

        if (!integration.isEnabled() && request.enabled()) {
            integration.setStatus("CONNECTED");
        } else if (!request.enabled()) {
            integration.setStatus("DISCONNECTED");
        }

        integration.setEnabled(request.enabled());
        if (request.configJson() != null) {
            integration.setConfigJson(request.configJson());
        }
        integration.setUpdatedAt(Instant.now());

        return IntegrationResponse.from(integrationRepository.save(integration));
    }

    @Transactional
    public void disconnect(UUID organizationId, String name) {
        Integration integration = integrationRepository
            .findByOrganizationIdAndName(organizationId, name.toUpperCase())
            .orElseThrow(() -> new ResourceNotFoundException("Integration not found: " + name));

        integration.setEnabled(false);
        integration.setStatus("DISCONNECTED");
        integration.setConfigJson(null);
        integration.setUpdatedAt(Instant.now());
        integrationRepository.save(integration);
    }
}
