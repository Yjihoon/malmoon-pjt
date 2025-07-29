package com.communet.malmoon.member.jwt.auth;

import static org.springframework.http.MediaType.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Calendar;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.transaction.annotation.Transactional;

import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.communet.malmoon.member.domain.Member;
import com.communet.malmoon.member.jwt.util.JwtTokenUtil;
import com.communet.malmoon.member.repository.MemberRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.ImmutableMap;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 요청 헤더에 jwt 토큰이 있는 경우, 토큰 검증 및 인증 처리 로직 정의.
 */
public class JwtAuthenticationFilter extends BasicAuthenticationFilter {

	private final MemberRepository memberRepository;

	public JwtAuthenticationFilter(AuthenticationManager authenticationManager, MemberRepository memberRepository) {
		super(authenticationManager);
		this.memberRepository = memberRepository;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
		throws ServletException, IOException {
		String header = request.getHeader(JwtTokenUtil.HEADER_STRING);

		if (header == null || !header.startsWith(JwtTokenUtil.TOKEN_PREFIX)) {
			filterChain.doFilter(request, response);
			return;
		}

		try {
			Authentication authentication = getAuthentication(request);
			SecurityContextHolder.getContext().setAuthentication(authentication);
		} catch (Exception ex) {
			response.setStatus(HttpStatus.UNAUTHORIZED.value());
			response.setContentType(APPLICATION_JSON_VALUE);
			response.setCharacterEncoding("UTF-8");
			String message = ex.getMessage();
			message = message == null ? "" : message;
			Map<String, Object> data = ImmutableMap.of(
				"timestamp", Calendar.getInstance().getTime(),
				"status", HttpStatus.UNAUTHORIZED.value(),
				"error", ex.getClass().getSimpleName(),
				"message", message,
				"path", request.getRequestURI()
			);
			PrintWriter pw = response.getWriter();
			pw.print(new ObjectMapper().writeValueAsString(data));
			pw.flush();
			return;
		}

		filterChain.doFilter(request, response);
	}

	@Transactional(readOnly = true)
	public Authentication getAuthentication(HttpServletRequest request) throws Exception {
		String token = request.getHeader(JwtTokenUtil.HEADER_STRING);
		if (token != null) {
			JWTVerifier verifier = JwtTokenUtil.getVerifier();
			JwtTokenUtil.handleError(token);
			DecodedJWT decodedJWT = verifier.verify(token.replace(JwtTokenUtil.TOKEN_PREFIX, ""));
			String email = decodedJWT.getSubject();

			if (email != null) {
				Optional<Member> member = memberRepository.getByEmail(email);
				if(member.isPresent()) {
					MemberDetails userDetails = new MemberDetails(member.get());
					UsernamePasswordAuthenticationToken jwtAuthentication = new UsernamePasswordAuthenticationToken(email,
						null, userDetails.getAuthorities());
					jwtAuthentication.setDetails(userDetails);
					return jwtAuthentication;
				}
			}
			return null;
		}
		return null;
	}
}

