package com.mnemo.memoryengine.meeting;

import com.mnemo.memoryengine.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "meeting_participants")
@Getter
@Setter
@NoArgsConstructor
public class MeetingParticipant {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "role_in_meeting")
    private String roleInMeeting;

    public MeetingParticipant(Meeting meeting, String name) {
        this.meeting = meeting;
        this.name = name;
    }
}
