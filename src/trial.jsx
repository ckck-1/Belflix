import React, { useEffect, useState } from "react";
import "./MovieList.css"; // Import the CSS file

const API_KEY = "dafd530aae9d04e5d9785e1d5c7ec0b7"; // Replace with your actual API key
const BASE_URL = "https://api.themoviedb.org/3/movie/popular";
const SEARCH_URL = "https://api.themoviedb.org/3/search/movie";

function Add() {
    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [query, setQuery] = useState("");

    const fetchMovies = (pageNumber) => {
        fetch(`${BASE_URL}?api_key=${API_KEY}&language=en-US&page=${pageNumber}`)
            .then((response) => response.json())
            .then((data) => {
                setMovies(data.results);
                setTotalPages(data.total_pages);
            })
            .catch((error) => console.error("Error fetching movies:", error));
    };

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

    useEffect(() => {
        fetchMovies(page);
    }, [page]);

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
                <button onClick={() => searchMovies(query)}>Search</button>
            </div>

            <div className="movie-container" style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                {movies.map((movie) => (
                    <div className="movie-card" key={movie.id}>
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            style={{ width: "200px", borderRadius: "10px" }}
                        />
                        <h3>{movie.title}</h3>
                        <p>⭐ {movie.vote_average}</p>
                        <a 
                            href={`https://www.themoviedb.org/movie/${movie.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            <button className="watch-button">TRAILER</button>
                        </a>
                    </div>
                ))}
            </div>

            {/* Pagination Buttons */}
            {movies.length > 0 && totalPages > 1 && (
                <div style={{ marginTop: "20px" }}>
                    <button onClick={() => setPage(page - 1)} disabled={page === 1}>
                        Previous
                    </button>
                    <span style={{ margin: "0 10px" }}>Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default Add;
