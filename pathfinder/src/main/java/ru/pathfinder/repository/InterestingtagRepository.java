package ru.pathfinder.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.pathfinder.domain.Interestingtag;

import java.util.List;

@Repository
public interface InterestingtagRepository extends JpaRepository<Interestingtag, Long> {
    
    @Query(value = "SELECT i FROM Interestingtag i WHERE " +
           "ST_DWithin(i.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), :radius) = true " +
           "AND i.isApproved = true")
    List<Interestingtag> findWithinRadius(@Param("lat") double lat, 
                                          @Param("lon") double lon, 
                                          @Param("radius") double radius);
    
    List<Interestingtag> findByCategoryId(Long categoryId);
}