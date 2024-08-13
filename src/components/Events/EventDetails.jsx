import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";
import { useState } from "react";
export default function EventDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const [confirmDeletion, setConfirmDeletion] = useState(false);
  const {
    mutate,
    isPending: pendingDeletion,
    isError: errorDeletion,
    error: errorMsg,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      navigate("/events");
    },
  });

  const confirmDelete = () => {
    setConfirmDeletion(true);
  };

  function handleDelete() {
    mutate({ id: params.id });
  }

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  let content;
  if (isError) {
    content = (
      <ErrorBlock
        title="Error fetching details"
        message={error.info?.message || "Couldn't load details"}
      />
    );
  }

  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <p>Fetching Event Data...</p>
      </div>
    );
  }

  if (data) {
    let formattedDate = new Date(data.date).toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={confirmDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formattedDate} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      {confirmDeletion && (
        <Modal onClose={() => setConfirmDeletion(false)}>
          <h2>Are you sure?</h2>
          <p>
            Do you really want delete this event? this action can't be undone
          </p>

          <div className="form-actions">
            {pendingDeletion && <p>Deleting in progress.. please wait</p>}
            {!pendingDeletion && (
              <>
                <button
                  onClick={() => setConfirmDeletion(false)}
                  className="button-text"
                >
                  Cancel
                </button>
                <button onClick={handleDelete} className="button">
                  Delete
                </button>
              </>
            )}
          </div>
          {errorDeletion && (
            <ErrorBlock
              title="Error deleting event"
              message={error.info?.message || "Couldn't delete event"}
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
