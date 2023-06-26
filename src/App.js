import { useEffect, useState } from "react";
import supabase from "./supabase";

import "./style.css";

function App() {
  // 1. Define state variable
  const [showForm, setShowForm] = useState(false);
  const [films, setFilms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGenre, setCurrentGenre] = useState("all");

  useEffect(
    function () {
      async function getMovies() {
        setIsLoading(true);

        let query = supabase.from("movies").select("*");

        if (currentGenre !== "all") query = query.eq("genre", currentGenre);

        const { data: movies, error } = await query
          .order("votesYes", { ascending: false })
          .limit(1000);

        if (!error) setFilms(movies);
        else alert('There was a problem getting data"');
        setFilms(movies);
        setIsLoading(false);
      }
      getMovies();
    },
    [currentGenre]
  );

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />

      {/* 2. Use state variable*/}
      {showForm ? (
        <NewFilmForm setFilms={setFilms} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <GenreFilter setCurrentGenre={setCurrentGenre} />

        {isLoading ? (
          <Loader />
        ) : (
          <FilmList films={films} setFilms={setFilms} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ showForm, setShowForm }) {
  const appTitle = "Watch with Me";

  return (
    <header className="header">
      <div className="logo">
        <img
          src="logo.png"
          height="68"
          width="68"
          alt="Today I Learned logo, purple and red circle"
        />
        <h1>{appTitle}</h1>
      </div>
      <button
        className="btn btn-large btn-open"
        // 3. Update state variable
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "Close" : "Add a Movie"}
      </button>
    </header>
  );
}

const CATEGORIES = [
  { name: "action", color: "#eab308" },
  { name: "comedy", color: "#16a34a" },
  { name: "drama", color: "#14b8d1" },
  { name: "documentary", color: "#ef4444" },
  { name: "family", color: "#eab308" },
  { name: "horror", color: "#db2777" },
  { name: "mystery", color: "#14b8a6" },
  { name: "romance", color: "#f97316" },
  { name: "sci-fi", color: "#8b5cf6" },
  { name: "thriller", color: "#3b82f6" },
  { name: "westerns", color: "#8a1fa6" },
];

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFilmForm({ setFilms, setShowForm }) {
  const [film_name, setFilmName] = useState("");
  const [wikipedia_page, setSource] = useState("");
  const [genre, setGenre] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = film_name.length;

  async function handleSubmit(e) {
    // 1. Prevent browser reload
    e.preventDefault();
    //console.log(text, source, category);

    if (
      film_name &&
      isValidHttpUrl(wikipedia_page) &&
      genre &&
      textLength <= 100
    ) {
      setIsUploading(true);
      const { data: newFilm, error } = await supabase
        .from("movies")
        .insert([{ film_name, wikipedia_page, genre }])
        .select();
      setIsUploading(false);

      if (!error) setFilms((films) => [newFilm[0], ...films]);

      setFilmName("");
      setSource("");
      setGenre("");

      setShowForm(false);
    }
  }

  return (
    <form className="film-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="What movie do you want to add..."
        value={film_name}
        onChange={(e) => setFilmName(e.target.value)}
        disabled={isUploading}
      />
      <span>{100 - textLength}</span>
      <input
        value={wikipedia_page}
        type="text"
        placeholder="Wikipedia page"
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose genre:</option>
        {CATEGORIES.map((cat) => (
          <option value={cat.name}>{cat.name.toUpperCase()}</option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function GenreFilter({ setCurrentGenre }) {
  return (
    <aside>
      <ul>
        <li className="genre">
          <button
            className="btn btn-all-genres"
            onClick={() => setCurrentGenre("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="genre">
            <button
              className="btn btn-genre"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentGenre(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FilmList({ films, setFilms }) {
  if (films.length === 0)
    return (
      <p className="message">
        No films in this genre yet! Upload the first one!
      </p>
    );

  return (
    <section>
      <ul className="films-list">
        {films.map((film) => (
          <Film key={film.id} film={film} setFilms={setFilms} />
        ))}
      </ul>
      <p>There are {films.length} movies in the database. Add your own!</p>
    </section>
  );
}

function Film({ film, setFilms }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed = film.votesYes + film.votesAmazing < film.votesNo;

  async function handleVote(columnName) {
    setIsUpdating(true);
    const { data: updatedFilm, error } = await supabase
      .from("movies")
      .update({ [columnName]: film[columnName] + 1 })
      .eq("id", film.id)
      .select();
    setIsUpdating(false);

    if (!error)
      setFilms((films) =>
        films.map((f) => (f.id === film.id ? updatedFilm[0] : f))
      );
  }

  return (
    <li className="film">
      <p>
        {isDisputed ? <span className="overruled">[OVER-RULED]</span> : null}
        {film.film_name}
        <a className="source" href={film.wikipedia_page} target="_blank">
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === film.genre)
            .color,
        }}
      >
        {film.genre}
      </span>
      <div className="vote-buttons">
        <button onClick={() => handleVote("votesYes")} disabled={isUpdating}>
          👍 {film.votesYes}
        </button>
        <button
          onClick={() => handleVote("votesAmazing")}
          disabled={isUpdating}
        >
          🤯 {film.votesAmazing}
        </button>
        <button onClick={() => handleVote("votesNo")} disabled={isUpdating}>
          ⛔️ {film.votesNo}
        </button>
      </div>
    </li>
  );
}

export default App;
