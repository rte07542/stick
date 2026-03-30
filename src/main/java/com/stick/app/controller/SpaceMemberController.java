package com.stick.app.controller;

import com.stick.app.dto.SpaceMemberCreateRequest;
import com.stick.app.dto.SpaceMemberResponse;
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
    public SpaceMemberResponse addMember(@PathVariable Long spaceId,
                                         @RequestBody SpaceMemberCreateRequest request){
        return SpaceMemberResponse.from(
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
