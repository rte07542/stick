package com.stick.app.controller;

import com.stick.app.domain.space.Space;
import com.stick.app.domain.space.SpaceMember;
import com.stick.app.dto.SpaceMemberCreateRequest;
import com.stick.app.service.SpaceMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/spaces/{spaceId}/members")
public class SpaceMemberController {
    private final SpaceMemberService spaceMemberService;

    @PostMapping
    public SpaceMember addMember(@PathVariable Long spaceId,
                                 @RequestBody SpaceMemberCreateRequest request){
        return spaceMemberService.addMember(spaceId, request.getUserId(), request.getRole());
    }

    @GetMapping
    public List<SpaceMember> getMember(@PathVariable Long spaceId) {
        return spaceMemberService.getMembersBySpaceId(spaceId);
    }

    @GetMapping("/{userId}")
    public SpaceMember getMember(@PathVariable Long spaceId,
                                 @PathVariable Long userId) {
        return spaceMemberService.getSpaceMember(spaceId,userId);
    }

}
