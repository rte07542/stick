package com.stick.app.repository.space;

import com.stick.app.domain.space.SpaceMember;
import com.stick.app.domain.space.SpaceRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SpaceMemberRepository extends JpaRepository<SpaceMember, Long> {
    @Query("SELECT sm FROM SpaceMember sm JOIN FETCH sm.user WHERE sm.space.id = :spaceId")
    List<SpaceMember> findBySpaceId(@Param("spaceId") Long spaceId);
    List<SpaceMember> findByUserId(Long userId);
    List<SpaceMember> findBySpaceIdAndRole(Long spaceId, SpaceRole role);
    Optional<SpaceMember> findBySpaceIdAndUserId(Long spaceId, Long userId);
    boolean existsBySpaceIdAndUserId(Long spaceId, Long userId);

}
