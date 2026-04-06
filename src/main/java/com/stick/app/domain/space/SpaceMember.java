package com.stick.app.domain.space;

import com.stick.global.domain.BaseEntity;
import com.stick.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(
        name = "space_members",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"space_id","user_id"})
        }
)
public class SpaceMember extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "space_id", nullable = false)
    private Space space;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SpaceRole role;

    @Builder
    public SpaceMember(Space space, User user, SpaceRole role) {
        this.space = space;
        this.user = user;
        this.role = role;
    }
}
