import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import PostEditor from './components/PostEditor';
import { Toast } from './components/UI';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import './index.css';

function App() {
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | null
  const [postEditor, setPostEditor] = useState(null); // null | post (for edit) | 'new'
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // Expose for Home page
  window.__authModal = setAuthModal;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar
          onWriteClick={() => setPostEditor('new')}
          onAuthClick={(mode) => setAuthModal(mode)}
        />

        <Routes>
          <Route path="/" element={
            <Home
              onEditPost={(post) => setPostEditor(post)}
              showToast={showToast}
            />
          } />
          <Route path="/posts/:id" element={<PostDetail showToast={showToast} />} />
          <Route path="/profile/:username" element={<Profile showToast={showToast} />} />
        </Routes>

        {/* Auth Modal */}
        {authModal && (
          <AuthModal
            mode={authModal}
            onClose={() => setAuthModal(null)}
            onSuccess={(msg) => showToast(msg, 'success')}
          />
        )}

        {/* Post Editor */}
        {postEditor && (
          <PostEditor
            post={postEditor === 'new' ? null : postEditor}
            onClose={() => setPostEditor(null)}
            onSaved={(post, msg) => {
              showToast(msg, 'success');
              window.location.href = `/posts/${post._id}`;
            }}
          />
        )}

        {/* Toast */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
