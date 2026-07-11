package com.mnemo.memoryengine.meeting;

import com.mnemo.memoryengine.common.ResourceNotFoundException;
import com.mnemo.memoryengine.meeting.dto.CreateMeetingRequest;
import com.mnemo.memoryengine.meeting.dto.MeetingResponse;
import com.mnemo.memoryengine.organization.Organization;
import com.mnemo.memoryengine.organization.OrganizationRepository;
import com.mnemo.memoryengine.security.AuthenticatedPrincipal;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final OrganizationRepository organizationRepository;

    public MeetingService(MeetingRepository meetingRepository, OrganizationRepository organizationRepository) {
        this.meetingRepository = meetingRepository;
        this.organizationRepository = organizationRepository;
    }

    @Transactional
@CacheEvict(value = "meetings", allEntries = true)
public MeetingResponse createMeeting(AuthenticatedPrincipal principal, CreateMeetingRequest request) {

    Organization organization = organizationRepository.findById(principal.organizationId())
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

    final Meeting meeting = new Meeting();
    meeting.setOrganization(organization);
    meeting.setTitle(request.title());
    meeting.setSource(request.source());
    meeting.setStartedAt(request.startedAt());
    meeting.setDurationSeconds(request.durationSeconds());

    if (request.participantNames() != null) {
        request.participantNames().forEach(name ->
                meeting.getParticipants().add(new MeetingParticipant(meeting, name)));
    }

    Meeting savedMeeting = meetingRepository.save(meeting);
    return MeetingResponse.from(savedMeeting);
}

    // readOnly=true keeps the persistence context open for the duration of this method,
    // which is required here: MeetingResponse.from() touches the lazy `participants`
    // collection, and with open-in-view disabled that access must happen inside a
    // transaction or it throws LazyInitializationException.
    @Transactional(readOnly = true)
    public Page<MeetingResponse> listMeetings(UUID organizationId, Pageable pageable) {
        return meetingRepository.findByOrganizationId(organizationId, pageable).map(MeetingResponse::from);
    }

    @Transactional(readOnly = true)
    public MeetingResponse getMeeting(UUID id) {
        return MeetingResponse.from(meetingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found: " + id)));
    }

    Meeting getMeetingEntity(UUID id) {
        return meetingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found: " + id));
    }
}
