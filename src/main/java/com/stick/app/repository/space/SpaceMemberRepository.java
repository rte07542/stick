package com.stick.app.repository.space;

import com.stick.app.domain.space.Space;
import com.stick.app.domain.space.SpaceMember;
import com.stick.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpaceMemberRepository extends JpaRepository<SpaceMember, Long> {
    List<SpaceMember> findBySpaceId(Long spaceId);
    List<SpaceMember> findByUserId(Long userId);
    Optional<SpaceMember> findBySpaceIdAndUserId(Long spaceId, Long userId);
    boolean existsBySpaceIdAndUserId(Long spaceId, Long userId);

}
