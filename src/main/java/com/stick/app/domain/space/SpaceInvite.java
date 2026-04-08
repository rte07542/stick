package com.stick.app.domain.space;

import com.stick.global.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "space_invite")
public class SpaceInvite extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private Long spaceId;

    @Column(nullable = false)
    private Long createdBy;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Builder
    public SpaceInvite(String code, Long spaceId, Long createdBy, LocalDateTime expiresAt) {
        this.code = code;
        this.spaceId = spaceId;
        this.createdBy = createdBy;
        this.expiresAt = expiresAt;
    }

}
