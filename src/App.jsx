import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const FACEBOOK_MESSAGE_URL = 'https://www.facebook.com/share/1AAj18QBwb/'

function getSavedUser() {
  try {
    const token = localStorage.getItem('birthday_auth_token')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return { ...payload, token }
  } catch {
    localStorage.removeItem('birthday_auth_token')
    return null
  }
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('birthday_theme') || 'light')
  const [user, setUser] = useState(getSavedUser)
  const [name, setName] = useState(user?.name || '')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [wishes, setWishes] = useState([])

  const loadWishes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/wishes`)
      if (response.ok) setWishes(await response.json())
    } catch {
      setStatus('Wishes will appear when the birthday server is available.')
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('auth')
    const authError = params.get('authError')
    if (token) {
      localStorage.setItem('birthday_auth_token', token)
      const signedInUser = getSavedUser()
      setUser(signedInUser)
      setName(signedInUser?.name || '')
      setStatus('You are signed in. Thank you for celebrating with me!')
      window.history.replaceState({}, '', window.location.pathname)
    }
    if (authError) {
      setStatus(`Sign-in could not be completed: ${authError}`)
      window.history.replaceState({}, '', window.location.pathname)
    }
    loadWishes()
  }, [])

  useEffect(() => {
    localStorage.setItem('birthday_theme', theme)
  }, [theme])

  const startSignIn = (provider) => {
    window.location.assign(`${API_URL}/api/auth/${provider}`)
  }

  const signOut = () => {
    localStorage.removeItem('birthday_auth_token')
    setUser(null)
    setName('')
    setStatus('You have signed out.')
  }

  const submitWish = async (event) => {
    event.preventDefault()
    if (!user?.token) {
      setStatus('Please sign in with Google before sending your birthday wish.')
      return
    }
    setStatus('Saving your birthday wish...')
    try {
      const response = await fetch(`${API_URL}/api/wishes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({ sender_name: name, message }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not save your wish.')
      setWishes((current) => [data, ...current])
      setMessage('')
      setStatus('Your wish was saved and added to the birthday wishes list.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  return (
    <div className={`website ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <div className="night-particles" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => <span key={index} />)}
      </div>
      <nav className="navbar">
        <a href="#home" className="logo">R<span>.</span></a>
        <div className="nav-links">
          <a href="#home">Home</a><a href="#about">About Me</a><a href="#gallery">Gallery</a><a href="#wishes">Wishes</a>
        </div>
        <div className="nav-actions"><div className="theme-toggle" role="group" aria-label="Color theme"><button type="button" aria-pressed={theme === 'light'} className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')}><span aria-hidden="true">☀</span>Light</button><button type="button" aria-pressed={theme === 'dark'} className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')}><span aria-hidden="true">☾</span>Dark</button></div><a href="#wishes" className="nav-button">Celebrate With Me</a></div>
      </nav>

      <main>
        <section className="hero" id="home">
          <div className="hero-content hero-reveal">
            <p className="eyebrow">A SPECIAL DAY • A BEAUTIFUL LIFE</p>
            <h1>Celebrating <br /><span>My Beautiful Journey</span></h1>
            <p className="hero-description">Another year of dreams, memories, growth, and beautiful moments. Welcome to my little celebration.</p>
            <a href="#about" className="gold-button">Discover My Story →</a>
            <p className="signature">With love, Mom Raksmey ♡</p>
          </div>
          <div className="hero-decoration photo-reveal"><div className="photo-frame"><img src="/images/profile.jpg" alt="Mom Raksmey" className="profile-photo" /></div></div>
        </section>

        <section className="intro" id="about">
          <p className="eyebrow">A LITTLE ABOUT ME</p><h2>A new chapter, <span>a new beginning.</span></h2>
          <p>Life is a collection of little moments. I am grateful for every lesson, every smile, and every person who makes my journey special.</p>
        </section>

        <section className="gallery" id="gallery">
          <p className="eyebrow">MY FAVORITE MOMENTS</p><h2>Memories to <span>treasure</span></h2>
          <div className="gallery-grid">
            {[1, 2, 3].map((image) => <div className="gallery-item" key={image}><img src={`/images/${image}.png`} alt={`My beautiful memory ${image}`} /></div>)}
          </div>
        </section>

        <section className="wishes" id="wishes">
          <p className="eyebrow">A NOTE FROM THE HEART</p>
          <h2>Send a <span>birthday wish.</span></h2>
          <p>Sign in with Google to send a birthday wish. Your Google name and profile photo may appear beside your wish in the public wishes list. We never receive or store your Google password.</p>

          <div className="wish-card">
            <div className="wish-form-content">
            {user ? (
              <div className="signed-in"><span>{user.avatarUrl && <img src={user.avatarUrl} alt="" />}</span><p>Signed in as <strong>{user.name || 'birthday guest'}</strong></p><button className="text-button" onClick={signOut}>Sign out</button></div>
            ) : (
              <div className="auth-options"><p>Sign in to send your birthday wish:</p><button type="button" className="oauth-button google" onClick={() => startSignIn('google')}><svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.23c0-.71-.08-1.4-.21-2.06H12v3.9h5.23a4.46 4.46 0 0 1-1.94 2.93v2.53h3.34c1.95-1.8 2.72-4.45 2.72-7.3Z"/><path fill="#34A853" d="M12 21.7c2.62 0 4.82-.86 6.43-2.33L15.09 16.8c-.89.6-2.03.96-3.09.96-2.52 0-4.65-1.7-5.41-3.99H3.14v2.61A9.7 9.7 0 0 0 12 21.7Z"/><path fill="#FBBC05" d="M6.59 13.77A5.83 5.83 0 0 1 6.29 12c0-.61.11-1.2.3-1.77V7.62H3.14A9.7 9.7 0 0 0 2.3 12c0 1.57.38 3.05.84 4.38l3.45-2.61Z"/><path fill="#EA4335" d="M12 6.24c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.81 3.32 14.61 2.3 12 2.3a9.7 9.7 0 0 0-8.86 5.32l3.45 2.61C7.35 7.94 9.48 6.24 12 6.24Z"/></svg>Continue with Google</button></div>
            )}
            <form className="wish-form" onSubmit={submitWish}>
              {user && <><label htmlFor="sender-name">Your name</label><input id="sender-name" value={name} onChange={(event) => setName(event.target.value)} maxLength="80" required />
              <label htmlFor="birthday-message">Your birthday wish</label><textarea id="birthday-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength="1000" required placeholder="Write a lovely message for Mom Raksmey..." />
              <button className="gold-button" type="submit">Send My Wish</button></>}
            </form>
            {status && <p className="form-status" role="status">{status}</p>}
            <a className="facebook-message" href={FACEBOOK_MESSAGE_URL} target="_blank" rel="noreferrer">Open my Facebook link ↗</a>
            {!user && <iframe className="birthday-pin" src="https://assets.pinterest.com/ext/embed.html?id=918523286557816408" title="Animated birthday sticker from Pinterest" loading="lazy" scrolling="no" />}
            </div>
            <div className="payment-qr">
              <h3>Send a little birthday love</h3>
              <p>Scan the ABA QR code if you would like to send a gift.</p>
              <a href="/images/qr.png" target="_blank" rel="noreferrer" aria-label="Open ABA payment QR code in a new tab"><img src="/images/qr.png" alt="ABA KHQR payment code for Raksmey Mom" /></a>
            </div>
          </div>

          {wishes.length > 0 && <div className="wish-list"><h3>Birthday wishes</h3>{wishes.map((wish) => <article className="wish-item" key={wish.id}><div>{wish.avatar_url && <img src={wish.avatar_url} alt="" />}<strong>{wish.sender_name}</strong></div><p>{wish.message}</p></article>)}</div>}
        </section>
      </main>
      <footer><p>Made with ♡ by Mom Raksmey</p><p>© 2026 · My Birthday Celebration</p></footer>
    </div>
  )
}

export default App
