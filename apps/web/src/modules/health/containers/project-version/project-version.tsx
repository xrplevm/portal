import { ProjectVersionIcon, ProjectVersionRoot } from "./project-version.styles";
import { Typography } from "@frontend/design-system-react/typography";

export function ProjectVersion(): JSX.Element {
    return (
        <ProjectVersionRoot>
            <ProjectVersionIcon />
            <Typography variant="body2Regular" color="placeholder">
                {`v${process.env.VERSION}`}
            </Typography>
        </ProjectVersionRoot>
    );
}
