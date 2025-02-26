import React, { useEffect, useState, useRef } from "react";
import "./MovieList.css"; // Import the CSS file

// Placeholder image in the public folder
const fallbackImage = "/placeholder-image.png"; // This should be placed in the public folder

const API_KEY = "dafd530aae9d04e5d9785e1d5c7ec0b7"; // Replace with your actual API key
const BASE_URL = "https://api.themoviedb.org/3/movie/popular";
const SEARCH_URL = "https://api.themoviedb.org/3/search/movie";

function Add() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  const dropdownRef = useRef(null); // Reference for the dropdown
  const buttonRef = useRef(null); // Reference for the genre button

  // Fetch genres on mount
  const fetchGenres = () => {
    fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`)
      .then((response) => response.json())
      .then((data) => setGenres(data.genres))
      .catch((error) => console.error("Error fetching genres:", error));
  };

  // Fetch movies using either the popular endpoint or discover endpoint (if genres are selected)
  const fetchMovies = (pageNumber) => {
    let url = "";
    if (selectedGenres.length > 0) {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&page=${pageNumber}&with_genres=${selectedGenres.join(",")}`;
    } else {
      url = `${BASE_URL}?api_key=${API_KEY}&language=en-US&page=${pageNumber}`;
    }
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setMovies(data.results);
        setTotalPages(data.total_pages);
      })
      .catch((error) => console.error("Error fetching movies:", error));
  };

  // Search movies by query (ignores genre filtering)
  const searchMovies = (searchTerm) => {
    if (searchTerm.trim() === "") {
      fetchMovies(1);
      return;
    }
    fetch(`${SEARCH_URL}?api_key=${API_KEY}&language=en-US&query=${searchTerm}`)
      .then((response) => response.json())
      .then((data) => {
        setMovies(data.results);
        setTotalPages(1);
      })
      .catch((error) => console.error("Error searching movies:", error));
  };

  // Function to fetch the trailer for the selected movie with autoplay enabled
  const fetchTrailer = (movie) => {
    fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${API_KEY}&language=en-US`)
      .then((response) => response.json())
      .then((data) => {
        // Look for a video of type "Trailer" or fallback to "Teaser" from YouTube
        const trailer = data.results.find(
          (video) =>
            (video.type === "Trailer" || video.type === "Teaser") &&
            video.site === "YouTube"
        );
        if (trailer) {
          const trailerEmbedUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
          setTrailerUrl(trailerEmbedUrl);
          setSelectedMovie(movie);
          setShowTrailer(true);
        } else {
          setTrailerUrl("");
          setSelectedMovie(null);
          alert("Trailer not available.");
        }
      })
      .catch((error) => {
        console.error("Error fetching trailer:", error);
        alert("Error fetching trailer.");
      });
  };

  // Handle genre selection from the dropdown (multiple selection enabled)
  const handleGenreSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value)
    );
    setSelectedGenres(selectedOptions);
  };

  // Toggle filter display
  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  // Clear selected genres
  const clearFilters = () => {
    setSelectedGenres([]);
  };

  // Close the dropdown when clicking outside or pressing ESC
  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target)
    ) {
      setShowFilter(false);
    }
  };

  const handleEscKey = (event) => {
    if (event.key === "Escape") {
      setShowFilter(false);
    }
  };

  // Fetch movies whenever the page or selectedGenres changes
  useEffect(() => {
    fetchMovies(page);
  }, [page, selectedGenres]);

  // Fetch genres on component mount
  useEffect(() => {
    fetchGenres();
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  return (
    <div>
      {/* Search Input */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search for a movie..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && searchMovies(query)}
          style={{ padding: "10px", width: "300px", borderRadius: "5px" }}
        />
        <button className="search" onClick={() => searchMovies(query)}>Search</button>
      </div>

      {/* Filter Button */}
      <div style={{ marginBottom: "20px" }}>
        <button ref={buttonRef} onClick={toggleFilter} style={{ padding: "10px 20px", borderRadius: "5px" }}>
          Genres
        </button>
      </div>

      {/* Genres Dropdown (appears when filter is toggled) */}
      {showFilter && (
        <div ref={dropdownRef} style={{ marginBottom: "20px", background: "transparent", width: "100%" }}>
          <label htmlFor="genreSelect">
            <h3>Select Genre(s):</h3>
          </label>
          <select
            id="genreSelect"
            multiple
            value={selectedGenres}
            onChange={handleGenreSelect}
            style={{
              padding: "10px",
              width: "100%",
              borderRadius: "5px",
              backgroundColor: "transparent",
              border: "1px solid #ccc",
              color: "inherit",
            }}
          >
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
          {selectedGenres.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <button onClick={clearFilters} style={{ padding: "5px 10px", borderRadius: "5px" }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Movies List */}
      <div className="movie-container" style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {movies.map((movie) => (
          <div className="movie-card" key={movie.id}>
            <img
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : fallbackImage}
              alt={movie.title}
              style={{ width: "200px", borderRadius: "10px" }}
            />
            <h3>{movie.title}</h3>
            <p>⭐ {movie.vote_average}</p>
            <button className="watch-button" onClick={() => fetchTrailer(movie)}>
              TRAILER
            </button>
          </div>
        ))}
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailerUrl && (
        <div className="trailer-modal" style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <button style={modalStyles.closeButton} onClick={() => setShowTrailer(false)}>
              Close
            </button>
            <iframe
              style={{ width: "100%", height: "450px" }}
              src={trailerUrl}
              title="Movie Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            {/* Movie description */}
            {selectedMovie && (
              <div style={{ marginTop: "20px", textAlign: "left" }}>
                <h3>Description</h3>
                <p>{selectedMovie.overview}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pagination Buttons */}
      {movies.length > 0 && totalPages > 1 && (
        <div style={{ marginTop: "20px" }}>
          <button onClick={() => setPage(page - 1)} disabled={page === 1}>
            Previous
          </button>
          <span style={{ margin: "0 10px" }}>
            Page {page} of {totalPages}
          </span>
          <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  content: {
    position: "relative",
    background: "transparent", // Transparent to remove any white borders
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center",
    maxWidth: "800px",
    width: "90%",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    padding: "5px 10px",
    cursor: "pointer",
  },
};

export default Add;
