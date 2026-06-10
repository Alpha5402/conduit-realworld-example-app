import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, followUser, unfollowUser } from '../services/profiles';
import { getArticles } from '../services/articles';
import ArticlesPreview from '../components/ArticlesPreview';
import ArticlesButtons from '../components/ArticlesButtons';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [articlesCount, setArticlesCount] = useState(0);
  const [activeTab, setActiveTab] = useState('author');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await getProfile(username);
      setProfile(res.profile);
    } catch (err) {
      navigate('/');
    }
  };

  const fetchArticles = async () => {
    const params = activeTab === 'author' 
      ? { author: profile.username } 
      : { favorited: profile.username };
    const res = await getArticles(params);
    setArticles(res.articles);
    setArticlesCount(res.articlesCount);
    setIsLoading(false);
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const res = await followUser(profile.username);
    setProfile(res.profile);
  };

  const handleUnfollow = async () => {
    const res = await unfollowUser(profile.username);
    setProfile(res.profile);
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (profile) {
      fetchArticles();
    }
  }, [profile, activeTab]);

  if (!profile) {
    return null;
  }

  const isOwnProfile = currentUser && currentUser.username === profile.username;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <img src={profile.image} className="user-img" alt="" />
            <h4>{profile.username}</h4>
            <p>{profile.bio}</p>

            {isOwnProfile ? (
              <Link to="/settings" className="btn btn-sm btn-outline-secondary action-btn">
                <i className="ion-gear-a"></i> Edit Profile Settings
              </Link>
            ) : (
              profile.following ? (
                <button className="btn btn-sm btn-outline-secondary action-btn" onClick={handleUnfollow}>
                  <i className="ion-minus-round"></i> Unfollow {profile.username}
                </button>
              ) : (
                <button className="btn btn-sm btn-outline-secondary action-btn" onClick={handleFollow}>
                  <i className="ion-plus-round"></i> Follow {profile.username}
                </button>
              )
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <ArticlesButtons activeTab={activeTab} setActiveTab={setActiveTab} />
            {isLoading ? (
              <div className="article-preview">Loading...</div>
            ) : articles.length === 0 ? (
              <div className="article-preview">No articles are here... yet.</div>
            ) : (
              <ArticlesPreview articles={articles} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;