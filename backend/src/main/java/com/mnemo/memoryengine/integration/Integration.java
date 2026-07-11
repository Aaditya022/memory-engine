package com.mnemo.memoryengine.integration;

import com.mnemo.memoryengine.organization.Organization;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "integrations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"organization_id", "name"})
})
@Getter
@Setter
@NoArgsConstructor
public class Integration {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private boolean enabled;

    @Column(columnDefinition = "TEXT")
    private String configJson;

    @Column(nullable = false)
    private String status = "DISCONNECTED";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Integration(Organization organization, String name) {
        this.organization = organization;
        this.name = name;
        this.enabled = false;
        this.status = "DISCONNECTED";
    }
}
