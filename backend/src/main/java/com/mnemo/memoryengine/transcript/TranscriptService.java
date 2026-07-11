package com.mnemo.memoryengine.transcript;

import com.mnemo.memoryengine.common.ResourceNotFoundException;
import com.mnemo.memoryengine.meeting.Meeting;
import com.mnemo.memoryengine.meeting.MeetingRepository;
import com.mnemo.memoryengine.transcript.dto.IngestTranscriptRequest;
import com.mnemo.memoryengine.transcript.dto.TranscriptResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TranscriptService {

    private final TranscriptRepository transcriptRepository;
    private final MeetingRepository meetingRepository;
    private final TranscriptProcessingService processingService;

    public TranscriptService(TranscriptRepository transcriptRepository,
                              MeetingRepository meetingRepository,
                              TranscriptProcessingService processingService) {
        this.transcriptRepository = transcriptRepository;
        this.meetingRepository = meetingRepository;
        this.processingService = processingService;
    }

    @Transactional
    public TranscriptResponse ingest(IngestTranscriptRequest request) {
        Meeting meeting = meetingRepository.findById(request.meetingId())
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found: " + request.meetingId()));

        Transcript transcript = new Transcript();
        transcript.setMeeting(meeting);
        transcript.setRawText(request.rawText());
        transcript = transcriptRepository.save(transcript);

        processingService.process(transcript);

        return TranscriptResponse.from(transcript);
    }

    public TranscriptResponse get(UUID id) {
        return TranscriptResponse.from(transcriptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transcript not found: " + id)));
    }

    public List<TranscriptResponse> listByMeeting(UUID meetingId) {
        return transcriptRepository.findByMeetingIdOrderByCreatedAtDesc(meetingId)
                .stream()
                .map(TranscriptResponse::from)
                .toList();
    }
}
