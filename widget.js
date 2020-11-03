const params = $widget.inputValue || "";
$widget.setTimeline((ctx) => {
  return {
    type: "text",
    props: {
      text: "hello world",
    },
  };
});
