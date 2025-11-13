import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Newsletter from "../components/Newsletter";
import { getPublicPageContent } from "../services/publicindex";
import Loader from "../components/Loader";
import "../Styles/PrivacyPolicy.css";

const PrivacyPolicy = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        console.log('Fetching privacy policy from API...');
        console.log('API URL:', import.meta.env.VITE_API_URL);
        
        const data = await getPublicPageContent('privacy-policy');
        
        console.log('✅ Privacy Policy API Response:', data);
        console.log('Response type:', typeof data);
        console.log('Is array:', Array.isArray(data));
        
        // Handle array response - take first item
        if (Array.isArray(data) && data.length > 0) {
          console.log('✅ Setting content from array:', data[0]);
          setContent(data[0]);
          setError(null);
        } else if (data && typeof data === 'object' && !Array.isArray(data)) {
          console.log('✅ Setting content from object:', data);
          setContent(data);
          setError(null);
        } else {
          console.warn('⚠️ No valid content found in response');
          setContent(null);
          setError('No content available');
        }
      } catch (err) {
        console.error('❌ Error fetching privacy policy:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError(err.response?.data?.message || err.message || 'Failed to load content');
        setContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll(".section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header />
      <div className="privacy-policy-page section">
        <div className="privacy-container">
          <h1 className="text-center">
            <span>Privacy</span> Policy
          </h1>

          {loading ? (
            <div className="loading">
              <Loader size="large" />
              <p>Loading privacy policy...</p>
            </div>
          ) : content ? (
            <div className="privacy-content">
              {/* Show last updated date if available */}
              {(content.updatedAt || content.createdAt) && (
                <p className="last-updated">
                  Last Updated: {new Date(content.updatedAt || content.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              )}
              
              {/* Display content - handle both HTML and plain text */}
              <div className="policy-content-body">
                {content.content && content.content.includes('<') ? (
                  <div dangerouslySetInnerHTML={{ __html: content.content }} />
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '16px' }}>
                    {content.content || 'No content available'}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="privacy-content">
              <p className="no-content">
                {error ? (
                  <>
                    <strong>Error loading content:</strong><br />
                    {error}<br /><br />
                    <small>Please check the browser console (F12) for more details.</small>
                  </>
                ) : (
                  'Privacy policy content is not available at the moment. Please check back later.'
                )}
              </p>
            </div>
          )}
        </div>
      </div>
      <Newsletter />
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
