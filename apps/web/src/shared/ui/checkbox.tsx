import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@shared/lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onChange, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            "w-5 h-5 border-2 rounded-md transition-colors flex items-center justify-center",
            checked
              ? "bg-primary border-primary"
              : "border-input bg-background",
            className
          )}
        >
          {checked && (
            <Check className="w-4 h-4 text-primary-foreground" />
          )}
        </div>
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }

