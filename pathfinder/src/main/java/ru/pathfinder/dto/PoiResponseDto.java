package ru.pathfinder.dto;

import lombok.Data;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.n52.jackson.datatype.jts.GeometrySerializer;
import org.locationtech.jts.geom.Point;

@Data
public class PoiResponseDto {
    private Long id;
    private String name;
    private String description;
    private String address;
    private Double averageRating;
    private CategoryDto category;
    private UserDto createdBy;
    
    @JsonSerialize(using = GeometrySerializer.class)
    private Point coordinates;
    
    private Double latitude;
    private Double longitude;
    
    // Геттеры для удобства фронтенда
    public Double getLatitude() {
        if (coordinates != null && !coordinates.isEmpty()) {
            return coordinates.getY();
        }
        return null;
    }
    
    public Double getLongitude() {
        if (coordinates != null && !coordinates.isEmpty()) {
            return coordinates.getX();
        }
        return null;
    }
    
    @Data
    public static class CategoryDto {
        private Long id;
        private String name;
        private String iconUrl;
    }
    
    @Data
    public static class UserDto {
        private Long id;
        private String username;
    }
}