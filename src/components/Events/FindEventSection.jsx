import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { fetchEvents } from "../../util/http";
import EventItem from "./EventItem";
import LoadingIndicator from "../UI/LoadingIndicator";
import ErrorBlock from "../UI/ErrorBlock";

export default function FindEventSection() {
  const searchElement = useRef();
  const [getSearchedItem, setSearchedItem] = useState("");

  const { data, isError, isPending } = useQuery({
    queryKey: ["events", { search: getSearchedItem }],
    queryFn: () => fetchEvents(getSearchedItem),
  });

  function handleSubmit(event) {
    event.preventDefault();
    setSearchedItem(searchElement.current.value);
  }
  let content = <p>Please enter a search term and to find events.</p>;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An Error Occured"
        message={data.info?.message || "Failed To Fetch Event"}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      </header>
      {content}
    </section>
  );
}
