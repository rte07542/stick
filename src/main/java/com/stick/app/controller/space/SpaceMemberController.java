package com.stick.app.controller;

import com.stick.app.domain.space.SpaceMember;
import com.stick.app.domain.space.SpaceRole;
import com.stick.app.dto.SpaceMemberCreateRequest;
import com.stick.app.dto.SpaceMemberResponse;
import com.stick.app.service.space.SpaceMemberService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/spaces/{spaceId}/members")
public class SpaceMemberController {
    private final SpaceMemberService spaceMemberService;

    @Value("${space.member.add-requires-owner}")
    private boolean addRequiresOwner;

    @PostMapping
    public SpaceMemberResponse addMember(@PathVariable Long spaceId,
                                         @RequestBody SpaceMemberCreateRequest request,
                                         HttpServletRequest httpRequest){
        Long userId = (Long) httpRequest.getAttribute("userId");

        if (addRequiresOwner) {
            SpaceMember requester = spaceMemberService.getSpaceMember(spaceId, userId);
            if (requester.getRole() != SpaceRole.OWNER) {
                throw new IllegalArgumentException("OWNER만 멤버를 추가할 수 있음");
            }
        } else {
            if (!spaceMemberService.isMember(spaceId, userId)) {
                throw new IllegalArgumentException("스페이스 멤버가 아님");
            }
        }

        return  SpaceMemberResponse.from(
                spaceMemberService.addMember(spaceId, request.getUserId(), request.getRole())
        );
    }

    @GetMapping
    public List<SpaceMemberResponse> getMember(@PathVariable Long spaceId) {
        return spaceMemberService.getMembersBySpaceId(spaceId)
                .stream()
                .map(SpaceMemberResponse::from)
                .toList();
    }

    @GetMapping("/{userId}")
    public SpaceMemberResponse getMember(@PathVariable Long spaceId,
                                 @PathVariable Long userId) {
        return SpaceMemberResponse.from(
                spaceMemberService.getSpaceMember(spaceId, userId)
        );
    }

}
