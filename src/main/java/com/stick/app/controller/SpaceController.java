package com.stick.app.controller;

import com.stick.app.domain.space.Space;
import com.stick.app.service.SpaceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/spaces")
public class SpaceController {

    private final SpaceService spaceService;

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
    public Space getSpaceById(@PathVariable Long id) {
        return spaceService.getSpaceById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteSpace(@PathVariable Long id) {
        spaceService.deleteSpace(id);
    }
}