package ru.pathfinder.service;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import ru.pathfinder.domain.Interestingtag;
import ru.pathfinder.domain.User;
import ru.pathfinder.repository.InterestingtagRepository;
import ru.pathfinder.repository.PoiRepository;

@Service
@RequiredArgsConstructor
public class InterestingtagService {
    private final InterestingtagRepository interestingtagRepository;
    private final PoiRepository poiRepository;

    public List<Interestingtag> searchWithinRadius(double lat, double lon, double radius) {
        return interestingtagRepository.findWithinRadius(lat, lon, radius);
    }

    public Interestingtag createTag(Interestingtag tag, User createdBy) {
        tag.setCreatedBy(createdBy);
        tag.setIsApproved(true);
        
        return interestingtagRepository.save(tag);
    }

    public Interestingtag getById(Long id) {
        return interestingtagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found with id: " + id));
    }

    public List<Interestingtag> getByCategory(Long categoryId) {
        return interestingtagRepository.findByCategoryId(categoryId);
    }

    public List<Interestingtag> searchWithinRadiusByCategory(double lat, double lon, double radius, Long categoryId) {
        if (categoryId != null) {
            return poiRepository.findWithinRadiusByCategory(lat, lon, radius, categoryId);
        }
        return poiRepository.findWithinRadius(lat, lon, radius);
    }
}