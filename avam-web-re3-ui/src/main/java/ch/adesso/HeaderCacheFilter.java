package ch.adesso;

import javax.servlet.*;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Add values to the response-header to avoid caching.
 */
public class HeaderCacheFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        httpResponse.setHeader("cache-control", "no-cache, no-store, must-revalidate");
        httpResponse.setHeader("expires", "-1");
        httpResponse.setHeader("pragma", "no-cache");
        chain.doFilter(request, response);
    }

    @Override
    public void init(FilterConfig filterConfig) {
        // Do nothing
    }

    @Override
    public void destroy() {
        // Do nothing
    }

}
