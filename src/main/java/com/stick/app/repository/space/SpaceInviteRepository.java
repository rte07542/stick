package com.stick.app.repository.space;

import com.stick.app.domain.space.SpaceInvite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SpaceInviteRepository extends JpaRepository<SpaceInvite, Long> {
    Optional<SpaceInvite> findByCode(String code);
}
