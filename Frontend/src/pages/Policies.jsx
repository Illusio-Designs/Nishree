import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Newsletter from "../components/Newsletter";
import { getPublicPageContent } from "../services/publicindex";
import CookingLoader from "../components/CookingLoader";
import "../styles/Policies.css";

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      const startTime = Date.now();
      try {
        console.log('Fetching policies from API...');
        console.log('API URL:', import.meta.env.VITE_API_URL);
        
        const data = await getPublicPageContent('policies');
        
        console.log('✅ Policies API Response:', data);
        console.log('Response type:', typeof data);
        console.log('Is array:', Array.isArray(data));
        
        // Handle array response
        if (Array.isArray(data) && data.length > 0) {
          console.log('✅ Setting policies from array:', data);
          setPolicies(data);
          setError(null);
        } else if (data && typeof data === 'object' && !Array.isArray(data)) {
          console.log('✅ Setting policies from object:', [data]);
          setPolicies([data]);
          setError(null);
        } else {
          console.warn('⚠️ No valid content found in response');
          setPolicies([]);
          setError('No content available');
        }
      } catch (err) {
        console.error('❌ Error fetching policies:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError(err.response?.data?.message || err.message || 'Failed to load content');
        setPolicies([]);
      } finally {
        // Ensure loader shows for at least 3 seconds
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 3000 - elapsedTime);
        setTimeout(() => setLoading(false), remainingTime);
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

  const activePolicy = policies[activeTab];

  if (loading) {
    return <CookingLoader />;
  }

  return (
    <>
      <Header />
      <div className="policies-page section">
        <div className="policies-container">
          <h1 className="text-center">
            <span>Our</span> Policies
          </h1>

          {policies.length > 0 ? (
            <>
              {/* Tabs Navigation */}
              <div className="policy-tabs">
                {policies.map((policy, index) => (
                  <button
                    key={policy.id || index}
                    className={`policy-tab ${activeTab === index ? 'active' : ''}`}
                    onClick={() => setActiveTab(index)}
                  >
                    {policy.title || `Policy ${index + 1}`}
                  </button>
                ))}
              </div>

              {/* Active Policy Content */}
              <div className="policy-content">
                {activePolicy && (
                  <>
                    {/* Show last updated date if available */}
                    {(activePolicy.updatedAt || activePolicy.createdAt) && (
                      <p className="last-updated">
                        Last Updated: {new Date(activePolicy.updatedAt || activePolicy.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    )}
                    
                    {/* Display content - handle both HTML and plain text */}
                    <div className="policy-content-body">
                      {activePolicy.content && activePolicy.content.includes('<') ? (
                        <div dangerouslySetInnerHTML={{ __html: activePolicy.content }} />
                      ) : (
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '16px' }}>
                          {activePolicy.content || 'No content available'}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="policy-content">
              <p className="no-content">
                {error ? (
                  <>
                    <strong>Error loading content:</strong><br />
                    {error}<br /><br />
                    <small>Please check the browser console (F12) for more details.</small>
                  </>
                ) : (
                  'Policy content is not available at the moment. Please check back later.'
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

export default Policies;
