package com.mnemo.memoryengine.transcript;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TranscriptRepository extends JpaRepository<Transcript, UUID> {
}
