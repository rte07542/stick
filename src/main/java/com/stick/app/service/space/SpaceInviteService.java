package com.stick.app.service.space;

import com.stick.app.domain.space.SpaceInvite;
import com.stick.app.domain.space.SpaceRole;
import com.stick.app.repository.space.SpaceInviteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SpaceInviteService {
    private final SpaceInviteRepository spaceInviteRepository;
    private final SpaceMemberService spaceMemberService;

    @Transactional
    public String createInvite(Long spaceId, Long userId) {
        String code = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();

        SpaceInvite invite = SpaceInvite.builder()
                .code(code)
                .spaceId(spaceId)
                .createdBy(userId)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        spaceInviteRepository.save(invite);
        return code;
    }

    @Transactional
    public Long joinByCode(String code, Long userId) {  // void → Long
        SpaceInvite invite = spaceInviteRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 초대코드"));
        if (invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("만료된 초대코드");
        }
        spaceMemberService.addMember(invite.getSpaceId(), userId, SpaceRole.MEMBER);
        return invite.getSpaceId();  // spaceId 반환
    }
}
