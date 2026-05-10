export default function TopicFilter({ topics, activeTopic, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onSelect('')}
        className={`tag-chip ${!activeTopic ? 'active' : ''}`}
      >
        All
      </button>
      {topics.map((topic) => (
        <button
          key={topic._id}
          onClick={() => onSelect(activeTopic === topic.name ? '' : topic.name)}
          className={`tag-chip ${activeTopic === topic.name ? 'active' : ''}`}
        >
          {topic.name}
        </button>
      ))}
    </div>
  );
}
