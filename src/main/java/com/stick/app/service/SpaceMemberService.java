package com.stick.app.service;

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

}
