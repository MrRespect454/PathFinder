package ru.pathfinder.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import ru.pathfinder.domain.Interestingtag;

@Repository
public interface PoiRepository extends JpaRepository<Interestingtag, Long> {
    
    // Поиск POI в радиусе с использованием PostGIS
    @Query(value = "SELECT * FROM interesting_tags " +
                   "WHERE is_approved = true " +
                   "AND ST_DWithin(coordinates, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), :radius)",
           nativeQuery = true)
    List<Interestingtag> findWithinRadius(@Param("lat") double lat,
                                          @Param("lon") double lon,
                                          @Param("radius") double radius);
    
    // Поиск POI в радиусе с фильтрацией по категории
    @Query(value = "SELECT * FROM interesting_tags " +
                   "WHERE is_approved = true " +
                   "AND ST_DWithin(coordinates, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), :radius) " +
                   "AND category_id = :categoryId",
           nativeQuery = true)
    List<Interestingtag> findWithinRadiusByCategory(@Param("lat") double lat,
                                                    @Param("lon") double lon,
                                                    @Param("radius") double radius,
                                                    @Param("categoryId") Long categoryId);
    
    // Поиск POI по названию в радиусе
    @Query(value = "SELECT * FROM interesting_tags " +
                   "WHERE is_approved = true " +
                   "AND ST_DWithin(coordinates, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), :radius) " +
                   "AND LOWER(name) LIKE LOWER(CONCAT('%', :query, '%'))",
           nativeQuery = true)
    List<Interestingtag> findWithinRadiusByName(@Param("lat") double lat,
                                               @Param("lon") double lon,
                                               @Param("radius") double radius,
                                               @Param("query") String query);
    
    // Получение POI по категории
    List<Interestingtag> findByCategoryId(Long categoryId);
    
    // Получение только одобренных POI
    List<Interestingtag> findByIsApprovedTrue();
}