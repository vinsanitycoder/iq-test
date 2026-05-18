export default function LogoutButton() {
  return (
    <form action="/api/hr/signout" method="POST">
      <button
        type="submit"
        className="text-sm text-white/60 hover:text-white transition-colors"
      >
        Log out
      </button>
    </form>
  )
}
