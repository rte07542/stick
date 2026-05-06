package com.stick.app.service.space;

import com.stick.app.domain.space.Space;
import com.stick.app.domain.space.SpaceMember;
import com.stick.app.domain.space.SpaceRole;
import com.stick.app.repository.space.SpaceMemberRepository;
import com.stick.app.repository.space.SpaceRepository;
import com.stick.user.domain.User;
import com.stick.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpaceMemberService {
    private final SpaceMemberRepository spaceMemberRepository;
    private final SpaceRepository spaceRepository;
    private final UserRepository userRepository;

    public SpaceMember addMember(Long spaceId, Long userId, SpaceRole role) {
        if (spaceMemberRepository.existsBySpaceIdAndUserId(spaceId, userId)){
            throw new IllegalArgumentException("이미 스페이스에 속한 유저");
        }

        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(()->new IllegalArgumentException("없는 스페이스"));

        User user = userRepository.findById(userId)
                .orElseThrow(()->new IllegalArgumentException("없는 유저"));

        SpaceMember spaceMember = SpaceMember.builder()
                .space(space)
                .user(user)
                .role(role)
                .build();
        return spaceMemberRepository.save(spaceMember);
    }

    public SpaceMember getSpaceMember(Long spaceId, Long userId) {
        return spaceMemberRepository.findBySpaceIdAndUserId(spaceId,userId)
                .orElseThrow(()->new IllegalArgumentException("스페이스 멤버가 아님"));
    }

    public boolean isMember(Long spaceId, Long userId) {
        return spaceMemberRepository.existsBySpaceIdAndUserId(spaceId, userId);
    }

    public List<SpaceMember> getMembersBySpaceId(Long spaceId) {
        return spaceMemberRepository.findBySpaceId(spaceId);
    }

    // OWNER 또는 ADMIN인지 확인
    public boolean isAdminOrOwner(Long spaceId, Long userId) {
        return spaceMemberRepository.findBySpaceIdAndUserId(spaceId, userId)
                .map(m-> m.getRole() == SpaceRole.OWNER || m.getRole() == SpaceRole.ADMIN)
                .orElse(false);
    }

    // 멤버 추방
    public void removeMember(Long spaceId, Long userId) {
        SpaceMember member = spaceMemberRepository.findBySpaceIdAndUserId(spaceId, userId)
                .orElseThrow(()-> new IllegalArgumentException("해당 멤버 없음"));
        spaceMemberRepository.delete(member);
    }

    //역할 변경
    public SpaceMember updateMemberRole(Long spaceId, Long targetUserId, SpaceRole newRole) {
        SpaceMember member = spaceMemberRepository.findBySpaceIdAndUserId(spaceId, targetUserId)
                .orElseThrow(()->new IllegalArgumentException("해당 멤버 없음"));
        if (member.getRole() == SpaceRole.OWNER && newRole != SpaceRole.OWNER) {
            throw new IllegalArgumentException("OWNER는 직접 강등할 수 없습니다. 다른 멤버에게 OWNER를 이전해야 합니다.");
        }
        // OWNER 이전 시 기존 OWNER를 ADMIN으로 강등
        if (newRole == SpaceRole.OWNER) {
            List<SpaceMember> currentOwners = spaceMemberRepository.findBySpaceIdAndRole(spaceId, SpaceRole.OWNER);
            for (SpaceMember owner : currentOwners) {
                if (!owner.getUser().getId().equals(targetUserId)) {
                    owner.setRole(SpaceRole.MEMBER);
                    spaceMemberRepository.save(owner);
                }
            }
        }
        member.setRole(newRole);
        return spaceMemberRepository.save(member);
    }



}
