import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import TaskCard from "./TaskCard";

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: number;
  userId: number;
}

interface User {
  id: string;
  name: string;
}

const App: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const savedTickets = localStorage.getItem("kanban-tickets");
    return savedTickets ? JSON.parse(savedTickets) : [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem("kanban-users");
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const [grouping, setGrouping] = useState<string>(() => {
    return localStorage.getItem("kanban-grouping") || "status";
  });

  const [sortBy, setSortBy] = useState<string>(() => {
    return localStorage.getItem("kanban-sortBy") || "priority";
  });

  const [groupedTickets, setGroupedTickets] = useState<Record<string, Ticket[]>>({});

  useEffect(() => {
    localStorage.setItem("kanban-grouping", grouping);
    localStorage.setItem("kanban-sortBy", sortBy);
  }, [grouping, sortBy]);

  useEffect(() => {
    // Fetch tickets and users only if they are not already in localStorage
    if (tickets.length === 0 || users.length === 0) {
      axios
        .get("https://api.quicksell.co/v1/internal/frontend-assignment")
        .then((response) => {
          const fetchedTickets = response.data.tickets;
          const fetchedUsers = response.data.users;
          
          setTickets(fetchedTickets);
          setUsers(fetchedUsers);

          // Store fetched data in localStorage
          localStorage.setItem("kanban-tickets", JSON.stringify(fetchedTickets));
          localStorage.setItem("kanban-users", JSON.stringify(fetchedUsers));
        })
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [tickets.length, users.length]);

  const groupAndSortTickets = useCallback(() => {
    if (tickets.length === 0 || users.length === 0) return;

    let groupedData: Record<string, Ticket[]> = {};

    switch (grouping) {
      case "status":
        groupedData = groupByField(tickets, "status");
        break;
      case "user":
        groupedData = groupByField(tickets, "userId", users);
        break;
      case "priority":
        groupedData = groupByField(tickets, "priority");
        break;
      default:
        groupedData = groupByField(tickets, "status");
    }

    for (let group in groupedData) {
      groupedData[group] = groupedData[group].sort((a: Ticket, b: Ticket) => {
        if (sortBy === "priority") {
          return b.priority - a.priority;
        } else if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
    }

    setGroupedTickets(groupedData);
  }, [tickets, grouping, sortBy, users]);

  useEffect(() => {
    groupAndSortTickets();
  }, [groupAndSortTickets]);

  const groupByField = (data: Ticket[], field: keyof Ticket, usersList: User[] = []): Record<string, Ticket[]> => {
    return data.reduce((acc: Record<string, Ticket[]>, ticket: Ticket) => {
      const groupKey =
        field === "userId"
          ? usersList.find((user) => user.id === ticket[field as keyof Ticket])?.name || "Unknown User"
          : (ticket[field] as string);
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(ticket);
      return acc;
    }, {});
  };

  const handleGroupingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGrouping(e.target.value);
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  return (
    <div>
      <div className="kanban-header">
        <div>
          <div className="kanban-control">
            <label htmlFor="grouping-select" className="grouptitle">Group by: </label>
            <select id="grouping-select" value={grouping} onChange={handleGroupingChange}>
              <option value="status">Status</option>
              <option value="user">User</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
        <div>
          <div className="kanban-control">
            <label htmlFor="sortby-select">Sort by: </label>
            <select id="sortby-select" value={sortBy} onChange={handleSortByChange}>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      </div>
      <div className="kanban-board">
        {Object.keys(groupedTickets).map((group) => (
          <div key={group} className="kanban-column">
            <h2 className="group">{group}</h2>
            {groupedTickets[group].map((ticket) => (
              <TaskCard
                key={ticket.id}
                id={ticket.id}
                title={ticket.title}
                status={ticket.status}
                priority={ticket.priority}
                userId={ticket.userId}
                users={users}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
