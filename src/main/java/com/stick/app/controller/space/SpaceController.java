package com.stick.app.controller.space;

import com.stick.app.domain.space.Space;
import com.stick.app.domain.space.SpaceMember;
import com.stick.app.domain.space.SpaceRole;
import com.stick.app.dto.SpaceMemberResponse;
import com.stick.app.service.space.SpaceMemberService;
import com.stick.app.service.space.SpaceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/spaces")
public class SpaceController {

    private final SpaceService spaceService;
    private final SpaceMemberService spaceMemberService;

    @PostMapping
    public Space createSpace(@RequestParam String name,
                             @RequestParam(required = false) String description,
                             HttpServletRequest request) {
        Long ownerId = (Long) request.getAttribute("userId");
        return spaceService.createSpace(name, ownerId, description);
    }

    @GetMapping
    public List<Space> getMySpace(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return spaceService.getSpacesByUserId(userId);
    }

    @GetMapping("/{id}")
    public Space getSpaceById(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if(!spaceMemberService.isMember(id, userId)) {
            throw new IllegalArgumentException("스페이스 멤버가 아님");
        }
        return spaceService.getSpaceById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteSpace(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        SpaceMember member = spaceMemberService.getSpaceMember(id, userId);
        if (member.getRole() != SpaceRole.OWNER) {
            throw new IllegalArgumentException("OWNER만 스페이스를 삭제할 수 있음");
        }
        spaceService.deleteSpace(id);
    }


    // 멤버 목록 조회
    @GetMapping("/{id}/members")
    public List<SpaceMemberResponse> getMembers(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (!spaceMemberService.isMember(id, userId)) {
            throw new IllegalArgumentException("스페이스 멤버가 아님");
        }
        return spaceMemberService.getMembersBySpaceId(id)
                .stream()
                .map(SpaceMemberResponse::from)
                .toList();
    }

    //역할 변경 (OWNER만)
    @PatchMapping("/{id}/members/{targetUserId}/role")
    public SpaceMemberResponse updateRole(@PathVariable Long id,
                                  @PathVariable Long targetUserId,
                                  @RequestBody SpaceRole role,
                                  HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        SpaceMember me = spaceMemberService.getSpaceMember(id, userId);
        if (me.getRole() != SpaceRole.OWNER) {
            throw new IllegalArgumentException("OWNER만 역할을 변경할 수 있음.");
        }
        return SpaceMemberResponse.from(spaceMemberService.updateMemberRole(id, targetUserId, role));
    }

    //멤버 추방
    @DeleteMapping("/{id}/members/{targetUserId}")
    public void removeMember(@PathVariable Long id,
                             @PathVariable Long targetUserId,
                             HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        SpaceMember me = spaceMemberService.getSpaceMember(id, userId);
        SpaceMember target = spaceMemberService.getSpaceMember(id, targetUserId);

        if (me.getRole() == SpaceRole.MEMBER) {
            throw new IllegalArgumentException("권한 없음");
        }
        if (me.getRole() == SpaceRole.ADMIN && target.getRole() != SpaceRole.MEMBER) {
            throw new IllegalArgumentException("ADMIN은 MEMBER만 추방할 수 있음");
        }
        spaceMemberService.removeMember(id, targetUserId);
    }

}