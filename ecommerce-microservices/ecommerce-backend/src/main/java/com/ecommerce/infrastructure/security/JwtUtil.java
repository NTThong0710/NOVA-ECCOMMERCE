package com.ecommerce.auth.infrastructure.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret:ThuongChoNhungNguoiThichCodeTayNhuBanNhungKhoaNayPhaiDuDaiMoiAnToan123!@#}")
    private String secret;

    private Key getSignKey() {
        byte[] keyBytes = secret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    public String generateAccessToken(String username, java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> authorities) {
        java.util.List<String> roles = authorities.stream().map(org.springframework.security.core.GrantedAuthority::getAuthority).toList();
        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String username, String deviceId) {
        long refreshTokenExpiration = 7L * 24 * 60 * 60 * 1000; // 7 days
        return Jwts.builder()
                .setSubject(username)
                .claim("deviceId", deviceId)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    @SuppressWarnings("unchecked")
    public java.util.List<String> extractRoles(String token) {
        return extractClaim(token, claims -> claims.get("roles", java.util.List.class));
    }

    public String extractDeviceId(String token) {
        return extractClaim(token, claims -> claims.get("deviceId", String.class));
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, io.jsonwebtoken.Claims::getExpiration);
    }

    public boolean isTokenValid(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    public boolean isTokenExpired(String token) {
        try {
            return extractClaim(token, Claims::getExpiration).before(new Date());
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            return true;
        } catch (Exception e) {
            return true;
        }
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }
}
