export default function Owner() {
  return (
    <div className="min-h-screen flex flex-col items-center pt-12 gap-y-3 w-1/2">
      <h1 className="text-4xl font-bold text-center">
        99_William Adama - JSDX
      </h1>
      <img
        src="https://upload.wikimedia.org/wikipedia/en/d/de/BSG_-_William_Adama_%28Edward_James_Olmos%29.jpg"
        alt="user image"
        className="w-64 rounded-2xl"
      />
      <p className="text-center">
        <span className="font-bold">Short Bio:</span>
        <br />
        William Adama is the steadfast commander of the Battlestar Galactica and
        a veteran of the First Cylon War. Principled, pragmatic, and fiercely
        protective of his crew, he leads humanity’s remaining survivors in their
        search for a new home after the destruction of the Twelve Colonies.
      </p>
      <a
        href="https://en.wikipedia.org/wiki/Battlestar_Galactica_(2004_TV_series)"
        target="_blank"
        rel="noopener noreferrer"
      >
        📖 Battlestar Galactica (2004 TV series)
      </a>
      <a
        href="https://archive.org/details/bat-gat-1/Battlestar+Galactica+2003+S00E01.mp4"
        target="_blank"
        rel="noopener noreferrer"
      >
        📽️ Battlestar Galactica (2004 TV series)
      </a>
      <br />
    </div>
  );
}
